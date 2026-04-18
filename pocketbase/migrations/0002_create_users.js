migrate(
  (app) => {
    try {
      app.findCollectionByNameOrId('_pb_users_auth_')
      return // already exists
    } catch (_) {}

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
        {
          name: 'role',
          type: 'select',
          values: ['admin', 'owner', 'editor', 'viewer', 'user'],
          maxSelect: 1,
        },
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('_pb_users_auth_')
      app.delete(collection)
    } catch (_) {}
  },
)
