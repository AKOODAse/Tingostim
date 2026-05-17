import json
import logging

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)

API_PREFIX = '/tingostim/api/v1'

VALID_STATUSES = {'idle', 'busy', 'maintenance'}


def _factory_legacy_id(partner):
    name = (partner.name or '').strip()
    lower = name.lower()
    if lower.startswith('factory ') and len(lower) > 8:
        return lower[8:].split()[0]
    return str(partner.id)


def _machine_to_dict(machine):
    type_label = dict(machine._fields['machine_type']._description_selection(machine.env)).get(
        machine.machine_type, machine.machine_type or ''
    )
    factory = machine.factory_id
    return {
        'id': machine.id,
        'name': machine.name,
        'type': type_label,
        'machine_type': machine.machine_type,
        'factory': factory.name,
        'location': factory.factory_location or '',
        'status': machine.status or 'unknown',
        'capacity': machine.current_capacity or 0.0,
        'hourly_rate': machine.hourly_rate or 0.0,
        'available_from': machine.available_from.isoformat() if machine.available_from else None,
        'specs': machine.specs or '',
        'image': machine.image_key or '',
        'last_seen': machine.last_seen.isoformat() if machine.last_seen else None,
        '_factory': {
            'id': _factory_legacy_id(factory),
            'name': factory.name,
            'color': factory.factory_color or '',
        },
    }


def _trending_to_dict(row):
    return {
        'id': row.id,
        'category': row.category,
        'demand_score': row.demand_score,
        'change': row.change_pct,
        'total_requests': row.total_requests,
        'top_product': row.top_product or '',
        'description': row.description or '',
    }


def _factory_to_leaderboard(partner):
    return {
        'id': _factory_legacy_id(partner),
        'factory_name': partner.name,
        'jobs_completed': partner.jobs_completed,
        'revenue': partner.revenue_total,
        'uptime': partner.uptime_pct,
        'rating': partner.rating,
        'specialty': partner.specialty or '',
        'streak': partner.streak_days,
    }


def _rental_request_to_dict(req):
    return {
        'id': req.id,
        'machine_id': req.machine_id.id,
        'machine_name': req.machine_id.name,
        'provider_factory': req.provider_partner_id.name,
        'requester_factory': req.requester_partner_id.name,
        'requested_date': req.requested_date.isoformat() if req.requested_date else None,
        'duration_hours': req.duration_hours,
        'notes': req.notes or '',
        'state': req.state,
        'estimated_cost': req.estimated_cost,
        'create_date': req.create_date.isoformat() if req.create_date else None,
    }


def _json_response(data, status=200):
    return request.make_json_response(data, status=status)


def _error(message, status):
    return _json_response({'error': message}, status=status)


def _read_json_body():
    try:
        raw = request.httprequest.data or b'{}'
        if isinstance(raw, (bytes, bytearray)):
            raw = raw.decode('utf-8')
        return json.loads(raw or '{}')
    except (ValueError, UnicodeDecodeError):
        return None


class TingostimAPI(http.Controller):

    # ---------- Read endpoints (require Odoo session) ----------

    @http.route(f'{API_PREFIX}/machines', type='http', auth='user', methods=['GET'], csrf=False)
    def list_machines(self, **kwargs):
        machines = request.env['tingostim.machine'].search([])
        return _json_response([_machine_to_dict(m) for m in machines])

    @http.route(f'{API_PREFIX}/machines/<int:machine_id>', type='http', auth='user', methods=['GET'], csrf=False)
    def get_machine(self, machine_id, **kwargs):
        machine = request.env['tingostim.machine'].browse(machine_id).exists()
        if not machine:
            return _error('machine not found', 404)
        return _json_response(_machine_to_dict(machine))

    @http.route(f'{API_PREFIX}/trending', type='http', auth='user', methods=['GET'], csrf=False)
    def list_trending(self, **kwargs):
        rows = request.env['tingostim.trending'].search([])
        return _json_response([_trending_to_dict(r) for r in rows])

    @http.route(f'{API_PREFIX}/leaderboard', type='http', auth='user', methods=['GET'], csrf=False)
    def list_leaderboard(self, **kwargs):
        factories = request.env['res.partner'].search([('is_factory', '=', True)])
        return _json_response([_factory_to_leaderboard(f) for f in factories])

    # ---------- Rental request endpoints (require Odoo session) ----------

    @http.route(f'{API_PREFIX}/rental_requests', type='http', auth='user', methods=['GET'], csrf=False)
    def list_rental_requests(self, mine=None, **kwargs):
        domain = []
        if mine:
            partner_id = request.env.user.partner_id.id
            domain = ['|', ('requester_partner_id', '=', partner_id), ('provider_partner_id', '=', partner_id)]
        rows = request.env['tingostim.rental_request'].search(domain)
        return _json_response([_rental_request_to_dict(r) for r in rows])

    @http.route(f'{API_PREFIX}/rental_requests', type='http', auth='user', methods=['POST'], csrf=False)
    def create_rental_request(self, **kwargs):
        payload = _read_json_body()
        if payload is None:
            return _error('invalid JSON body', 400)

        machine_id = payload.get('machine_id')
        requested_date = payload.get('requested_date')
        duration_hours = float(payload.get('duration_hours') or 1.0)
        notes = payload.get('notes') or ''

        if not machine_id or not requested_date:
            return _error('machine_id and requested_date are required', 400)

        user = request.env.user
        if not user.partner_id.is_factory:
            return _error('requester is not a factory user', 403)

        machine = request.env['tingostim.machine'].browse(int(machine_id)).exists()
        if not machine:
            return _error('machine not found', 404)

        if machine.factory_id.id == user.partner_id.id:
            return _error('cannot rent a machine from your own factory', 400)

        req = request.env['tingostim.rental_request'].create({
            'machine_id': machine.id,
            'requester_partner_id': user.partner_id.id,
            'requested_date': requested_date,
            'duration_hours': duration_hours,
            'notes': notes,
        })
        return _json_response(_rental_request_to_dict(req), status=201)

    # ---------- Telemetry ingest (token auth, public route) ----------

    @http.route(f'{API_PREFIX}/machines/<int:machine_id>/log', type='http', auth='public', methods=['POST'], csrf=False)
    def ingest_log(self, machine_id, **kwargs):
        token = request.httprequest.headers.get('X-Ingest-Token') or ''
        machine = request.env['tingostim.machine'].sudo().browse(machine_id).exists()
        if not machine or not token or token != machine.ingest_token:
            return _error('unauthorized', 401)

        payload = _read_json_body()
        if payload is None:
            return _error('invalid JSON body', 400)

        status = payload.get('status')
        if status not in VALID_STATUSES:
            return _error(f'status must be one of {sorted(VALID_STATUSES)}', 400)

        try:
            capacity = float(payload.get('capacity', 0.0))
        except (TypeError, ValueError):
            return _error('capacity must be numeric', 400)

        log = request.env['tingostim.machine_log'].sudo().create({
            'machine_id': machine.id,
            'status': status,
            'capacity': capacity,
            'raw_payload': json.dumps(payload),
        })
        return _json_response({'ok': True, 'log_id': log.id, 'machine_status': machine.status}, status=201)
