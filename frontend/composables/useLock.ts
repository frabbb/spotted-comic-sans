export default function useLock() {
  const locked = useState("lock", () => false);

  return locked;
}
