export default function timeout(delay = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}
