let resolveWarmup: () => void

/** Resolves once ShaderWarmup has precompiled every shader variant */
export const warmedUp = new Promise<void>(resolve => (resolveWarmup = resolve))

export const markWarmedUp = () => resolveWarmup()
