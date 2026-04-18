migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedData = [
      {
        email: 'ggim.foz@gmail.com',
        name: 'Insp. Área Fagundes',
        role: 'viewer',
        job_title: 'Visualizador',
        can_delete_reports: false,
        can_generate_reports: false,
        allowed_tabs: [],
      },
      {
        email: 'admin@ggim.foz.br',
        name: 'Gestor GGIM',
        role: 'admin',
        job_title: 'Proprietário',
        can_delete_reports: true,
        can_generate_reports: true,
        allowed_tabs: [],
      },
      {
        email: 'ggim.ctfoz@gmail.com',
        name: 'L. Gustavo S. de Assis',
        role: 'user',
        job_title: 'Editor',
        can_delete_reports: false,
        can_generate_reports: false,
        allowed_tabs: [],
      },
      {
        email: 'estagiariosggimfoz@gmail.com',
        name: 'Stephany',
        role: 'user',
        job_title: 'Editor',
        can_delete_reports: false,
        can_generate_reports: false,
        allowed_tabs: [],
      },
      {
        email: 'karleedoso@gmail.com',
        name: 'Karinsca',
        role: 'viewer',
        job_title: 'Visualizador',
        can_delete_reports: false,
        can_generate_reports: false,
        allowed_tabs: [],
      },
    ]

    for (const data of seedData) {
      let record
      try {
        record = app.findFirstRecordByData('_pb_users_auth_', 'email', data.email)
      } catch (_) {
        record = new Record(users)
      }

      record.setEmail(data.email)
      if (!record.get('passwordHash')) {
        record.setPassword('Skip@Pass')
      }
      record.setVerified(true)

      record.set('name', data.name)
      record.set('role', data.role)
      record.set('job_title', data.job_title)
      record.set('can_delete_reports', data.can_delete_reports)
      record.set('can_generate_reports', data.can_generate_reports)
      record.set('allowed_tabs', data.allowed_tabs)

      app.save(record)
    }
  },
  (app) => {
    // Revert not strictly required
  },
)
