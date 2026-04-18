migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedData = [
      {
        id: '84a93454-2557-4c3a-b49e-81f0eeec9260',
        email: 'ggim.foz@gmail.com',
        name: 'Insp. Área Fagundes',
        role: 'viewer',
        job_title: 'Visualizador',
        can_delete_reports: false,
        can_generate_reports: false,
        allowed_tabs: [],
      },
      {
        id: 'b04e67fc-3449-442f-8bb5-bfdf687b3d57',
        email: 'admin@ggim.foz.br',
        name: 'Gestor GGIM',
        role: 'admin',
        job_title: 'Proprietário',
        can_delete_reports: true,
        can_generate_reports: true,
        allowed_tabs: [],
      },
      {
        id: 'd044c1ce-7754-4455-b99b-471915877eb3',
        email: 'ggim.ctfoz@gmail.com',
        name: 'L. Gustavo S. de Assis',
        role: 'user',
        job_title: 'Editor',
        can_delete_reports: false,
        can_generate_reports: false,
        allowed_tabs: [],
      },
      {
        id: 'db4178aa-9de7-4b52-9575-dc13f6b570c0',
        email: 'estagiariosggimfoz@gmail.com',
        name: 'Stephany',
        role: 'user',
        job_title: 'Editor',
        can_delete_reports: false,
        can_generate_reports: false,
        allowed_tabs: [],
      },
      {
        id: 'f084022e-301e-4c1a-bbde-284cb5b91043',
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
        try {
          record = app.findRecordById('_pb_users_auth_', data.id)
        } catch (_) {
          record = new Record(users)
          record.set('id', data.id)
        }
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
