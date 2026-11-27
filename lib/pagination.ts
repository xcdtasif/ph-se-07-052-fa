// A page number from the URL (e.g. `?page=`), 1 for anything that isn't a whole page above 1
export const parsePage = (value: string | string[] | undefined) => {
  const page = Number(value)

  return Number.isInteger(page) && page > 1 ? page : 1
}
