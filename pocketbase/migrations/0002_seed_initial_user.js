migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    let userId = null

    try {
      const existing = app.findAuthRecordByEmail('users', 'gmtengustavo@hotmail.com')
      userId = existing.id
    } catch (_) {
      const record = new Record(users)
      record.setEmail('gmtengustavo@hotmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      app.save(record)
      userId = record.id
    }

    try {
      app.findFirstRecordByData('profiles', 'email', 'gmtengustavo@hotmail.com')
    } catch (_) {
      const profiles = app.findCollectionByNameOrId('profiles')
      const profileRecord = new Record(profiles)
      profileRecord.set('user_id', userId)
      profileRecord.set('email', 'gmtengustavo@hotmail.com')
      profileRecord.set('name', 'Admin')
      profileRecord.set('Role', 'admin')
      profileRecord.set('allowed_tabs', [
        'Dashboard BI',
        'Registrar Atividade',
        'Importar Arquivo',
        'Acervo Histórico',
        'Videomonitoramento',
        'Observatório',
        'Relatórios GGIM',
      ])
      app.save(profileRecord)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'gmtengustavo@hotmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
