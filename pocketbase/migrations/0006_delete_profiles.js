migrate(
  (app) => {
    try {
      const profiles = app.findCollectionByNameOrId('profiles')
      app.delete(profiles)
    } catch (_) {}
  },
  (app) => {
    // Cannot easily revert collection deletion
  },
)
