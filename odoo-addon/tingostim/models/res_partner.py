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
