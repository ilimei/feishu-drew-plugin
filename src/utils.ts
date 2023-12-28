export const getFileName = (name: string) => {
  return name.split('.').shift();
}

export const isJsonFile = (name: string) => {
  return name.endsWith('.json');
}
