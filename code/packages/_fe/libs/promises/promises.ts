/**
 * ================================================
 * FePromise Family – Enhanced Promise Patterns
 * ================================================
 *
 * These classes solve common pain points when working with Promises:
 *   - You often want to create a Promise but keep the `resolve`/`reject`
 *     functions accessible *outside* the constructor.
 *   - You frequently need to observe the current state (pending/fulfilled/rejected).
 *   - You need coordination patterns like "readiness signaling" or
 *     "request → execution" flows.
 *
 * The implementation is quite sophisticated because extending native `Promise`
 * in TypeScript/JavaScript has many gotchas.
 */

const _IdxofResolve = 0 as const
const _IdxofReject = 1 as const

/**
 * Extracts the type of the `resolve` function from a Promise constructor.
 * This is a clever TypeScript trick because the executor function's signature
 * is not directly easy to reference.
 */
type _Resolve <
  FulfillmentValueT = true,
> =
  Parameters<
    ConstructorParameters<typeof Promise<FulfillmentValueT>>[0]
  >[typeof _IdxofResolve]

/**
 * Simple reject function type. The commented version above shows the
 * more "correct" but verbose way using the same trick as `_Resolve`.
 */
type _Reject <
  ErrorReasonT = unknown
> =
  (reason?: ErrorReasonT) => void  
  // Parameters<ConstructorParameters<typeof Promise<FulfillmentValueT>>[0]>[1]

/**
 * Base class: A Promise that exposes `resolve` and `reject` directly on itself.
 *
 * This is the TypeScript-friendly equivalent of the classic `Promise.withResolvers()`
 * pattern, but as a class so it can be further extended with state.
 */
export class FePromisewithResolvers <
  FulfillmentValueT = true,
  ErrorReasonT = unknown
> extends Promise<FulfillmentValueT> {

  /** 
   * Critical for proper Promise subclassing.
   * Without this, `.then()`, `.catch()`, etc. would return `FePromisewithResolvers`
   * instances instead of regular `Promise`s (which is usually not wanted).
   */
  static get [Symbol.species]() { // @TODO
    return Promise
  }

  /**
   * Returns a "clean" version of this promise without the `resolve`/`reject`
   * methods visible. Useful when you want to hand out the promise to consumers
   * without giving them control.
   */
  public get promise () { return this as Omit<typeof this, 'resolve'|'reject'> }

  /** Will be populated in the constructor */
  public resolve!: _Resolve<FulfillmentValueT>
  public reject!: _Reject<ErrorReasonT>

  /**
   * We keep the original tuple here because the `resolve` and `reject`
   * we assign to `this` can be overridden in subclasses (see FePromise).
   * This gives us a stable reference to the *real* Promise constructor
   * functions.
   */
  protected _canonical_resolve_reject!: [_Resolve<FulfillmentValueT>, _Reject<ErrorReasonT>]

  public constructor () {
    let resolve_reject: [_Resolve<FulfillmentValueT>, _Reject<ErrorReasonT>]

    // This is the only legal way to capture resolve/reject when extending Promise
    super((resolve, reject) => {
      resolve_reject = [resolve, reject]
    })

    this._canonical_resolve_reject = resolve_reject!
    this.resolve = resolve_reject![_IdxofResolve]
    this.reject = resolve_reject![_IdxofReject]
  }
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
// https://shaky.sh/promise-with-resolvers/


/**
 * ================================================
 * FePromise – Stateful Promise
 * ================================================
 *
 * Adds observable state (`status`, `fulfillmentValue`, `errorReason`).
 * Similar in spirit to React's `useTransition` status or TC39's "Async Context".
 */
export class FePromise <  // @TODO WIP!
  FulfillmentValueT = true,
  ErrorReasonT = unknown
> extends FePromisewithResolvers<FulfillmentValueT,ErrorReasonT> {

  protected $status: 'awaited'|'fulfilled'|'failed'|'undefined'|'obsolite' = 'undefined'
  protected $fulfillmentValue: FulfillmentValueT | PromiseLike<FulfillmentValueT> |undefined
  protected $errorReason: ErrorReasonT|undefined

  public get status () { return this.$status }
  public get stillAwaited () { return ['awaited','undefined'].includes(this.$status) }
  public get fulfillmentValue () { return this.$fulfillmentValue }
  public get errorReason () { return this.$errorReason }

  /**
   * Override resolve to also update our internal state.
   * Note we call the *canonical* version (not `this.resolve`) to avoid
   * infinite recursion if someone overrides it again.
   */
  public override resolve = (
    value?: FulfillmentValueT | PromiseLike<FulfillmentValueT>
  ) => {
    this.$fulfillmentValue = value
    this.$status = 'fulfilled'
    this._canonical_resolve_reject![_IdxofResolve](value || true as FulfillmentValueT)
    return value
  }

  public override reject = (err?: ErrorReasonT) => {
    this.$errorReason = err
    this.$status = 'failed'
    this._canonical_resolve_reject![_IdxofReject](err)
    return err
  }

  /** Marks this promise as no longer relevant (useful for cleanup patterns). */
  public makeObsolete (err?: ErrorReasonT) {
    this.$status = 'obsolite'
    if (err) {
      this.reject(err)
    }
    return err
  }

  public constructor () {
    super()
    this.$status = 'awaited'  // 'pending'
  }
}

/**
 * ================================================
 * FeReadinessSignaling
 * ================================================
 *
 * Simple "wait until ready" pattern.
 *
 * Common use: `const ready = new FeReadinessSignaling();`
 * Later: `ready.pass()` or `ready.fail(err)`
 *
 * Consumers do: `await ready.tillReady`
 */
export class FeReadinessSignaling <   // @TODO WIP!
  FulfillmentValueT = true,
  ErrorReasonT = unknown
> extends FePromise<FulfillmentValueT,ErrorReasonT> {

  public get tillReady () {
    return this.promise as Promise<FulfillmentValueT>
  }

  public pass = (value?: FulfillmentValueT) =>
    this.resolve(value || true as FulfillmentValueT)

  public fail = (err?: ErrorReasonT) =>
    this.reject(err)

  public constructor () {
    super()
  }
}

/**
 * ================================================
 * FeExecSignaling – Two-phase signaling
 * ================================================
 *
 * Useful when you have two distinct moments:
 *   1. Something is *requested*
 *   2. The execution is *completed* (or skipped)
 *
 * Example use case: debounced save, optimistic UI updates, command pattern, etc.
 */
export type FeExecSignalingErrorCodes = 'RequestSkipped'

export type FeExecSignalingError = {
  message: string,
  execSignaling: FeExecSignalingErrorCodes,
}

export class FeExecSignaling <
  ExecutionValueT = true|false,
  RequestedValueT = true,
  ErrorReasonT = unknown
> extends FePromise<ExecutionValueT,ErrorReasonT> {

  protected _requested: FePromisewithResolvers<RequestedValueT>

  /** Promise that resolves when `request()` is called */
  public get tillRequested () {
    return this._requested.promise as Promise<RequestedValueT>
  }

  public request (value?: RequestedValueT) {
    this._requested.resolve(value || true as RequestedValueT)
    return value
  }

  /** Reject the *request* side (e.g. to cancel a pending operation) */
  public skip (err?: FeExecSignalingError & ErrorReasonT) {
    this._requested.reject(err)
    return err
  }  // @TODO maybe different typing

  /** Promise that resolves when `done()` / `fail()` is called */
  public get tillDone () {
    return this.promise as Promise<ExecutionValueT>
  }

  public done = (value?: ExecutionValueT) => this.resolve(value || true as ExecutionValueT)

  public skipped = () => this.done(false as ExecutionValueT)

  public fail = (err?: FeExecSignalingError & ErrorReasonT) => this.reject(err)

  public constructor () {
    super()
    // Note: This is a bit of a hack. Ideally we would use the same class,
    // but there's a circularity issue in the type system here.
    this._requested = Promise.withResolvers<RequestedValueT>() as FePromisewithResolvers<RequestedValueT> 
    // ^ @TODO incorrect conversion, hack!!
  }
}


// Just classic:

/**
 * ================================================
 * Classic DeferredPromise (for comparison)
 * ================================================
 *
 * The traditional, simpler version. Less type-safe and doesn't track state.
 * Kept here for reference.
 */
export class DeferredPromise extends Promise<void> {
  static get [Symbol.species]() {
    return Promise;
  }

  // These will be overwritten in the constructor
  declare resolve: () => void
  declare reject: (reason?: any) => void

  constructor () {
    let internalResolve = () => { };
    let internalReject = () => { };

    super((resolve, reject) => {
        internalResolve = resolve;
        internalReject = reject;
    });

    // @ts-expect-error - intentional assignment after super()
    this.resolve = internalResolve;
    // @ts-expect-error
    this.reject = internalReject;
  }
}

// https://gist.github.com/domenic/8ed6048b187ee8f2ec75
