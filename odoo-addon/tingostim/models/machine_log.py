from odoo import fields, models

from .machine import STATUS_SELECTION


class TingostimMachineLog(models.Model):
    _name = 'tingostim.machine_log'
    _description = 'Tingostim Machine Telemetry Log'
    _order = 'log_time desc, id desc'
    _rec_name = 'log_time'

    machine_id = fields.Many2one(
        comodel_name='tingostim.machine',
        string='Machine',
        required=True,
        ondelete='cascade',
        index=True,
    )
    log_time = fields.Datetime(
        string='Logged At',
        required=True,
        default=fields.Datetime.now,
        index=True,
    )
    status = fields.Selection(
        selection=STATUS_SELECTION,
        string='Status',
        required=True,
    )
    capacity = fields.Float(string='Capacity (%)', default=0.0)
    raw_payload = fields.Text(
        string='Raw Payload',
        help='Original JSON payload from the telemetry agent (for forward compatibility).',
    )
