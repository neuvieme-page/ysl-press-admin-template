export function filterDistinctIds<Entity>(entities): Entity[] {
  const ids = [];
  return entities.filter((entity) => {
    if (ids.indexOf(entity.id) >= 0) {
      return false
    }
    ids.push(entity.id)
    return true
  })
}