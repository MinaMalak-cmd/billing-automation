export function getCurrentMonth() {
    return new Date().toLocaleString("default", { month: "long" });
}