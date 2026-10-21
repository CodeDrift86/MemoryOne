import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"

// Follow an explicit data-theme on <html> if a host sets one, otherwise the OS setting.
const root = document.documentElement
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)")
function applyTheme() {
  const chosen = root.dataset.theme
  root.classList.toggle("dark", chosen ? chosen === "dark" : darkQuery.matches)
}
applyTheme()
darkQuery.addEventListener("change", applyTheme)
new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
