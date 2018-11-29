export function makePermalink(string) {
  if (!string) {
    return;
  }

  let permlink = string
    .replace(/&/g, '')
    .replace(/ /g, '-')
    .replace(/--/g, '-')
    .toLowerCase();

  return permlink;
}
