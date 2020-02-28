const fruits = [
  'Apple',
  'Watermelon',
  'Orange',
  'Pear',
  'Cherry',
  'Strawberry',
  'Nectarine',
  'Grape',
  'Mango',
  'Blueberry',
  'Pomegranate',
  'Plum',
  'Banana',
  'Raspberry',
  'Mandarin',
  'Jackfruit',
  'Papaya',
  'Kiwi',
  'Pineapple',
  'Lime',
  'Lemon',
  'Apricot',
  'Grapefruit',
  'Melon',
  'Coconut',
  'Peach',
  'Tomato',
].map(f => f.toLowerCase())

export function validContent(str?: string) {
  if (!str) return true
  return fruits.includes(str.toLowerCase().trim())
}
