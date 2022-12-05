type Options = {
  removedItemsMethod?: "delete" | "disconnect"
}

function isDeepEqual(val1: any, val2: any): boolean {
  if (val1 === val2) {
    return true
  } else if (typeof val1 === "object" && typeof val2 === "object") {
    if (val1 === null || val2 === null) {
      return val1 === val2
    } else if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) {
        return false
      }
      for (let i = 0; i < val1.length; i++) {
        if (!isDeepEqual(val1[i], val2[i])) {
          return false
        }
      }
      return true
    } else {
      const keys1 = Object.keys(val1)
      const keys2 = Object.keys(val2)
      if (keys1.length !== keys2.length) {
        return false
      }
      for (const key of keys1) {
        if (!isDeepEqual(val1[key], val2[key])) {
          return false
        }
      }
      return true
    }
  } else {
    return false
  }
}

/**
 * helper to convert array-like fields into Prisma Api format
 * it converts arrays like [ 1,2,3 ] to something like { create: [1,2,3] }
 * @example
 * value = [ {name: 1}, {id: 2, name: 3} ]
 * initial = [ {id: 2, name: 2}, {id: 3} ]
 * prepareArrayField(value, initial)
 * // returns
 * {
 *    create: [ {name: 1} ],
 *    update: [ { data: {name: 3}, where: {id: 2} } ],
 *    remove: [ {id: 3} ]
 * }
 */
export function prepareArrayField(
  value: any[],
  initial?: any[],
  mapper?: null | ((item: any, initial?: any) => any),
  {removedItemsMethod = "delete"}: Options = {},
) {
  value = value.filter(Boolean)

  const valueById = value.reduce((res, item) => {
    item.id && (res[item.id] = item)
    return res
  }, {})

  const initialById =
    initial?.reduce((res, item) => {
      item.id && (res[item.id] = item)
      return res
    }, {}) || {}

  const create: any[] = []
  const connect: any[] = []
  const update: any[] = []
  const remove = initial?.filter(({id}) => !valueById[id])

  for (const item of value) {
    const {id} = item

    if (id) {
      if (initialById[id]) {
        if (!isDeepEqual(item, initialById[id])) {
          update.push(item)
        }
      } else {
        connect.push(item)
      }
    } else {
      create.push(item)
    }
  }

  const connectItems = connect.map(({id}) => ({id}))

  const removeItems = remove?.map(({id}) => ({id}))

  const createItems = mapper ? create.map((item) => mapper(item)) : create

  const updateItems = update.map((item) => {
    const initialItemValue = initialById[item.id]

    const changed = Object.keys(item).reduce((acc: {[key: string]: unknown}, key) => {
      const value = item[key]
      if (!isDeepEqual(value, initialItemValue && initialItemValue[key])) {
        acc[key] = value
      }
      return acc
    }, {})

    return {
      data: mapper ? mapper(changed, initialItemValue) : changed,
      where: {id: item.id},
    }
  })

  return {
    connect: connectItems.length ? connectItems : undefined,

    create: createItems.length ? createItems : undefined,

    update: updateItems?.length ? updateItems : undefined,

    [removedItemsMethod]: removeItems?.length ? removeItems : undefined,
  }
}
