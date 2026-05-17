{
    'name': 'Tingostim',
    'version': '18.0.1.0.0',
    'summary': 'B2B platform for Ostim factories to rent idle machines and share capacity',
    'description': """
Tingostim
=========
Closed B2B platform connecting Ostim factories so they can rent each
other's idle machines and share manufacturing capacity. Machines, telemetry
logs, and rental requests are managed here; the React frontend consumes
the REST controllers in this module.
""",
    'author': 'Tingostim Graduation Team',
    'category': 'Manufacturing',
    'license': 'LGPL-3',
    'depends': ['base', 'web', 'contacts', 'mail'],
    'data': [
        'security/security_groups.xml',
        'security/ir.model.access.csv',
        'views/res_partner_views.xml',
        'views/machine_views.xml',
        'views/machine_log_views.xml',
        'views/rental_request_views.xml',
        'views/menus.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
