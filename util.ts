function pad(s: String, length: number, padString: String): String {
  if (s.length >= length) return s;
  if (padString.length === 0) {
    throw new Error("padString is empty!");
  }
  while (s.length < length) {
    s = `${padString}${s}`
  }
  return s
}

export function formatDate() {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = pad(String(date.getMonth() + 1), 2, "0");
  const day = String(date.getDate());
  return `${year}-${month}-${day}`;
}

export function formatDateAndTime() {
  const dateString = formatDate();
  const date = new Date();
  const hours = pad(String(date.getHours()), 2, "0");
  const mins = pad(String(date.getMinutes()), 2, "0");
  const secs = pad(String(date.getSeconds()), 2, "0");
  return `${dateString}_${hours}_${mins}_${secs}`
}
