import secrets

from odoo import api, fields, models


MACHINE_TYPES = [
    ('cnc_milling', 'CNC Milling'),
    ('cnc_turning', 'CNC Turning'),
    ('laser_cutting', 'Laser Cutting'),
    ('injection_molding', 'Injection Molding'),
    ('printing_3d', '3D Printing'),
    ('sheet_metal', 'Sheet Metal'),
    ('welding', 'Welding'),
    ('other', 'Other'),
]

STATUS_SELECTION = [
    ('idle', 'Idle'),
    ('busy', 'Busy'),
    ('maintenance', 'Maintenance'),
    ('unknown', 'Unknown'),
]


class TingostimMachine(models.Model):
    _name = 'tingostim.machine'
    _description = 'Tingostim Machine'
    _order = 'factory_id, name'

    name = fields.Char(required=True)
    machine_type = fields.Selection(
        selection=MACHINE_TYPES,
        string='Type',
        required=True,
        default='other',
    )
    factory_id = fields.Many2one(
        comodel_name='res.partner',
        string='Factory',
        required=True,
        domain="[('is_factory', '=', True)]",
        ondelete='restrict',
    )

    hourly_rate = fields.Monetary(string='Hourly Rate', currency_field='currency_id')
    currency_id = fields.Many2one(
        comodel_name='res.currency',
        default=lambda self: self.env.ref('base.EUR', raise_if_not_found=False)
        or self.env.company.currency_id,
    )
    available_from = fields.Date(string='Available From')
    specs = fields.Text(string='Specifications')
    image_key = fields.Char(
        string='Image Key',
        help='UI icon key, e.g. cnc, laser, mold, 3d.',
    )

    ingest_token = fields.Char(
        string='Ingest Token',
        copy=False,
        groups='tingostim.group_tingostim_platform_admin',
        help='Per-machine secret used by the telemetry agent to POST status logs.',
    )

    log_ids = fields.One2many(
        comodel_name='tingostim.machine_log',
        inverse_name='machine_id',
        string='Telemetry Logs',
    )
    latest_log_id = fields.Many2one(
        comodel_name='tingostim.machine_log',
        compute='_compute_latest_log',
        store=True,
    )
    status = fields.Selection(
        selection=STATUS_SELECTION,
        compute='_compute_latest_log',
        store=True,
        string='Status',
        default='unknown',
    )
    current_capacity = fields.Float(
        compute='_compute_latest_log',
        store=True,
        string='Current Capacity (%)',
    )
    last_seen = fields.Datetime(
        compute='_compute_latest_log',
        store=True,
    )

    active = fields.Boolean(default=True)

    @api.depends('log_ids', 'log_ids.log_time')
    def _compute_latest_log(self):
        for machine in self:
            latest = machine.log_ids.sorted(key='log_time', reverse=True)[:1]
            machine.latest_log_id = latest
            if latest:
                machine.status = latest.status
                machine.current_capacity = latest.capacity
                machine.last_seen = latest.log_time
            else:
                machine.status = 'unknown'
                machine.current_capacity = 0.0
                machine.last_seen = False

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('ingest_token'):
                vals['ingest_token'] = secrets.token_urlsafe(32)
        return super().create(vals_list)

    def action_regenerate_token(self):
        for machine in self:
            machine.ingest_token = secrets.token_urlsafe(32)
