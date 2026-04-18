migrate(
  (app) => {
    const collection = new Collection({
      id: '_pb_users_auth_',
      name: 'users',
      type: 'auth',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: 'id = @request.auth.id',
      deleteRule: 'id = @request.auth.id',
      authRule: '',
      manageRule: null,
      fields: [
        { name: 'name', type: 'text' },
        { name: 'role', type: 'text' },
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('users')
      app.delete(collection)
    } catch (_) {}
  },
)
