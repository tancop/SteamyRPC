/**
 * Injected WebSocket instance used to communicate with the Python server
 */
declare var rpc: WebSocket | undefined

/**
 * Decides if this payload should replace any previous one or leave it alone. This property gets replaced
 * by a `true` or `false` literal during template substitution.
 */
declare var $REPLACE: boolean