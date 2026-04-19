migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedUsers = [
      { email: 'admin_seed@ggim.foz.br', name: 'Administrador (Seed)', role: 'admin' },
      { email: 'user_seed@ggim.foz.br', name: 'Usuário (Seed)', role: 'user' },
    ]

    for (const u of seedUsers) {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', u.email)
      } catch (_) {
        const record = new Record(users)
        // Explicitly DO NOT set the 'id' field, so PocketBase auto-generates a valid 15-char ID
        record.setEmail(u.email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', u.name)
        if (users.fields.getByName('role')) {
          record.set('role', u.role)
        }
        app.save(record)
      }
    }
  },
  (app) => {
    const emails = ['admin_seed@ggim.foz.br', 'user_seed@ggim.foz.br']
    for (const email of emails) {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
