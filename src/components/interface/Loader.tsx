import './Loader.css'

export default function Loader() {
  return (
    // above drei <Html> elements, whose default zIndexRange starts at 16777271
    <div className="fixed inset-0 z-2147483647 flex items-center justify-center bg-[#035BA2] font-title text-[4rem] text-white text-shadow">
      Loading
      <div className="absolute top-0 left-1/2 w-full max-w-60 -translate-x-1/2 overflow-visible opacity-75">
        <svg
          className="bubbles overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 701 1024"
        >
          <g className="bubbles-large" strokeWidth="7">
            <g>
              <g transform="translate(10 940)">
                <circle cx="35" cy="35" r="35" />
              </g>
            </g>
            <g>
              <g transform="translate(373 940)">
                <circle cx="35" cy="35" r="35" />
              </g>
            </g>
            <g>
              <g transform="translate(408 940)">
                <circle cx="35" cy="35" r="35" />
              </g>
            </g>
            <g>
              <g transform="translate(621 940)">
                <circle cx="35" cy="35" r="35" />
              </g>
            </g>
            <g>
              <g transform="translate(179 940)">
                <circle cx="35" cy="35" r="35" />
              </g>
            </g>
          </g>

          <g className="bubbles-small" strokeWidth="4">
            <g>
              <g transform="translate(147 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(255 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(573 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(429 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(91 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(640 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(321 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(376 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(376 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
            <g>
              <g transform="translate(497 984)">
                <circle cx="15" cy="15" r="15" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
