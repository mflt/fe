
const _IdxofResolve = 0 as const
const _IdxofReject = 1 as const

type _Resolve <
  FulfillmentValueT = true,
> =
  Parameters<
    ConstructorParameters<typeof Promise<FulfillmentValueT>>[0]
  >[typeof _IdxofResolve]

type _Reject <
  ErrorReasonT = unknown
> =
  (reason?: ErrorReasonT) => void  
  // Parameters<ConstructorParameters<typeof Promise<FulfillmentValueT>>[0]>[1]

export class FePromisewithResolvers <
  FulfillmentValueT = true,
  ErrorReasonT = unknown
> extends Promise<FulfillmentValueT> {

  static get [Symbol.species]() { // @TODO
    return Promise
  }
  public get promise () { return this as Omit<typeof this, 'resolve'|'reject'> }
  public resolve!: _Resolve<FulfillmentValueT>
  public reject!: _Reject<ErrorReasonT>
  protected _canonical_resolve_reject!: [_Resolve<FulfillmentValueT>, _Reject<ErrorReasonT>]

  public constructor () {
    let resolve_reject: [_Resolve<FulfillmentValueT>, _Reject<ErrorReasonT>]
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
  protected _requested: PromiseWithResolvers<RequestedValueT>
  public get tillRequested () {
    return this._requested.promise as Promise<RequestedValueT>
  }
  public request (value?: RequestedValueT) {
    this._requested.resolve(value || true as RequestedValueT)
    return value
  }
  public skip (err?: FeExecSignalingError & ErrorReasonT) {
    this._requested.reject(err)
    return err
  }  // @TODO maybe different typing
  public get tillDone () {
    return this.promise as Promise<ExecutionValueT>
  }
  public done = (value?: ExecutionValueT) => this.resolve(value || true as ExecutionValueT)
  public skipped = () => this.done(false as ExecutionValueT)
  public fail = (err?: FeExecSignalingError & ErrorReasonT) => this.reject(err)
  public constructor () {
    super()
    this._requested = Promise.withResolvers<RequestedValueT>()
  }
}


// Just classic:

export class DeferredPromise extends Promise<void> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor () {
    let internalResolve = () => { };
    let internalReject = () => { };
    super((resolve, reject) => {
        internalResolve = resolve;
        internalReject = reject;
    });
    // @ts-expect-error
    this.resolve = internalResolve;
    // @ts-expect-error
    this.reject = internalReject;
  }
}

// https://gist.github.com/domenic/8ed6048b187ee8f2ec75
