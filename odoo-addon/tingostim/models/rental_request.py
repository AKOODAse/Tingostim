from odoo import api, fields, models


REQUEST_STATES = [
    ('pending', 'Pending'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
]


class TingostimRentalRequest(models.Model):
    _name = 'tingostim.rental_request'
    _description = 'Tingostim Rental Request'
    _inherit = ['mail.thread']
    _order = 'create_date desc'
    _rec_name = 'display_name'

    machine_id = fields.Many2one(
        comodel_name='tingostim.machine',
        string='Machine',
        required=True,
        ondelete='restrict',
    )
    provider_partner_id = fields.Many2one(
        comodel_name='res.partner',
        string='Provider Factory',
        related='machine_id.factory_id',
        store=True,
        readonly=True,
    )
    requester_partner_id = fields.Many2one(
        comodel_name='res.partner',
        string='Requesting Factory',
        required=True,
        domain="[('is_factory', '=', True)]",
        ondelete='restrict',
    )
    requested_date = fields.Date(string='Requested Date', required=True)
    duration_hours = fields.Float(string='Duration (hours)', default=1.0)
    notes = fields.Text(string='Notes')
    state = fields.Selection(
        selection=REQUEST_STATES,
        string='Status',
        default='pending',
        required=True,
        tracking=True,
    )

    estimated_cost = fields.Monetary(
        string='Estimated Cost',
        compute='_compute_estimated_cost',
        store=True,
        currency_field='currency_id',
    )
    currency_id = fields.Many2one(
        related='machine_id.currency_id',
        store=True,
        readonly=True,
    )
    display_name = fields.Char(compute='_compute_display_name', store=True)

    @api.depends('machine_id.hourly_rate', 'duration_hours')
    def _compute_estimated_cost(self):
        for req in self:
            req.estimated_cost = (req.machine_id.hourly_rate or 0.0) * (req.duration_hours or 0.0)

    @api.depends('machine_id', 'requester_partner_id', 'requested_date')
    def _compute_display_name(self):
        for req in self:
            parts = [
                req.requester_partner_id.name or '?',
                '→',
                req.machine_id.name or '?',
            ]
            if req.requested_date:
                parts.append(f'({req.requested_date})')
            req.display_name = ' '.join(parts)

    def action_accept(self):
        self.write({'state': 'accepted'})

    def action_reject(self):
        self.write({'state': 'rejected'})

    def action_complete(self):
        self.write({'state': 'completed'})

    def action_cancel(self):
        self.write({'state': 'cancelled'})
