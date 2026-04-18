migrate(
  (app) => {
    let users
    try {
      users = app.findCollectionByNameOrId('_pb_users_auth_')
    } catch (_) {
      return // collection not found, skip
    }

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'admin@ggim.foz.br')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('admin@ggim.foz.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Administrador')
    record.set('role', 'admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@ggim.foz.br')
      app.delete(record)
    } catch (_) {}
  },
)
