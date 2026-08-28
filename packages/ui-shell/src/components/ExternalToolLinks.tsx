import type { ExternalTool } from '../types'

interface Props {
  tools: ExternalTool[]
}

/**
 * The 6G-DALI tool suite, rendered into the navbar so the same set is reachable
 * from every app. Entries with no URL are dropped rather than pointing
 * somewhere that does not exist, so a partially configured deployment simply
 * shows fewer links; with nothing configured the group and its divider vanish.
 */
export function ExternalToolLinks({ tools }: Props) {
  const linked = tools.filter((tool): tool is ExternalTool & { url: string } =>
    Boolean(tool.url && tool.url.trim()))
  if (linked.length === 0) return null

  return (
    <>
      {linked.map(tool => (
        <li className="nav-item" key={tool.label}>
          {/* Text only. The label is always rendered — with no icon beside it,
              hiding it on narrow screens would leave an empty clickable box. */}
          <a
            // Same tab: these navigate away from this app rather than opening
            // alongside it. No rel is needed — noopener/noreferrer only guarded
            // the window.opener handle a new tab would have created.
            className="nav-link external-tool-link"
            href={tool.url}
            title={tool.title}
          >
            {tool.label}
          </a>
        </li>
      ))}
      <li className="nav-item external-tool-divider" aria-hidden="true" />
    </>
  )
}
