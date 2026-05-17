from odoo import fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    is_factory = fields.Boolean(
        string='Is Factory',
        default=False,
        help='Mark this partner as a factory participating in the Tingostim platform.',
    )
    factory_location = fields.Char(string='Factory Location')
    founded_year = fields.Integer(string='Founded Year')
    employee_count = fields.Integer(string='Employees')
    factory_bio = fields.Text(string='Factory Bio')
    factory_color = fields.Char(
        string='Brand Color',
        size=7,
        help='Hex color (e.g. #E83828) used as the factory accent in the UI.',
    )
    specialty = fields.Char(string='Specialty')

    jobs_completed = fields.Integer(string='Jobs Completed')
    revenue_total = fields.Monetary(
        string='Revenue (EUR)',
        currency_field='kpi_currency_id',
    )
    kpi_currency_id = fields.Many2one(
        comodel_name='res.currency',
        default=lambda self: self.env.ref('base.EUR', raise_if_not_found=False)
        or self.env.company.currency_id,
    )
    uptime_pct = fields.Float(string='Uptime (%)')
    rating = fields.Float(string='Rating', digits=(2, 1))
    streak_days = fields.Integer(string='Streak (days)')

    machine_ids = fields.One2many(
        comodel_name='tingostim.machine',
        inverse_name='factory_id',
        string='Machines',
    )
    machine_count = fields.Integer(
        string='Machine Count',
        compute='_compute_machine_count',
    )

    def _compute_machine_count(self):
        for partner in self:
            partner.machine_count = len(partner.machine_ids)
