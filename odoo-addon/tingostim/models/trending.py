from odoo import fields, models


class TingostimTrending(models.Model):
    _name = 'tingostim.trending'
    _description = 'Tingostim Trending Category Snapshot'
    _order = 'demand_score desc, id'

    category = fields.Char(string='Category', required=True)
    demand_score = fields.Integer(string='Demand Score')
    change_pct = fields.Integer(
        string='Change (%)',
        help='Percentage change versus the previous period.',
    )
    total_requests = fields.Integer(string='Total Requests')
    top_product = fields.Char(string='Top Product')
    description = fields.Text(string='Description')
    factory_id = fields.Many2one(
        comodel_name='res.partner',
        string='Reporting Factory',
        domain="[('is_factory', '=', True)]",
        help='Factory whose data contributed this snapshot. Optional — set on demo seed only.',
    )
