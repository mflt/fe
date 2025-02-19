import { mergician, type MergicianOptions } from 'mergician'
import type {
  _Branded, _WithAssertedBrand, _FeMilliseconds,
} from '@mflt/_fe'
import {
  FeExecSignaling, FeReadinessSignaling,
  _feAssertIsSyncFunction, _feIsFunction, _feIsObject, _feIsArray,
  _feIsNotanEmptyObject, _feIsAsyncFunction, _feMakeRecordFeMapLike, $fe, _feDelay, 
} from '@mflt/_fe'


export class FeCatchComm {
  framingMessage: string | undefined
}

export type FeBsqrBlocksKeysT = string

const __waitingforRequestedBlocktoCompleteDefaultTimeout = 5000

export type FeBsqrToExecasFunctions <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {}, // @TODO prototype, aka processing ctx
> = Record<
  BlocksKeys,
  undefined | ((ctx: ExecCtx) => Promise<ExecCtx>)
>

export type FeBsqrExecSignals <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {},
> = Record<
  BlocksKeys,
  FeExecSignaling<ExecCtx, ExecCtx>
>

export interface IFeBsqrBaseUtilities {
  catchComm: FeCatchComm
}

export type FeBsqrBaseCtxSignals <
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> = {
  sequencerReady: FeReadinessSignaling<Utilities>
}

export type FeBsqrWaitingforRequestedBlocktoCompleteTimeouts <
  BlocksKeys extends FeBsqrBlocksKeysT
> = Record<
  BlocksKeys,  // @TODO partial?
  number | _FeMilliseconds  // @TODO test
>

export type FeBsqrAddtoSkipped  <
  BlocksKeys extends FeBsqrBlocksKeysT
> =
  | Array<BlocksKeys>
  | {
    blocks: Array<BlocksKeys>,
    builtinBlocks: Array<BlocksKeys>
  }

export interface IFeBsqrExecMods <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {},
> {
  addtoSkipped?: FeBsqrAddtoSkipped<BlocksKeys>
  // blockstoSkip?: BlocksKeys[] // @TODO typing
  // builtinBlockstoSkip?: Array<BlocksKeys> // @TODO typing
  blockstoExecasFunctions?: Partial<FeBsqrToExecasFunctions<BlocksKeys, ExecCtx>>
}

export abstract class IFeBlocksSequencerCtx <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {},
  // * @TODO but basically it's a matter of the implementation, which will pass it arround between blocks
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> /* implements CastArrayTtoSetTinRecord<IFeBsqrExecMods<BlocksKeys, ExecCtx>> */ {
  blockstoSkip!: Set<BlocksKeys>
  builtinBlockstoSkip!: Set<BlocksKeys>
  blockstoExecasFunctions!: Partial<FeBsqrToExecasFunctions<BlocksKeys, ExecCtx>>
  protected builtinBlocksFunctions?: Partial<FeBsqrToExecasFunctions<BlocksKeys, ExecCtx>>
  sequencerName?: string
  execSignals!: FeBsqrExecSignals<BlocksKeys, ExecCtx>
  ctxSignals!: FeBsqrBaseCtxSignals<Utilities>
  utilities!: Utilities
  getExecCtx!: () => ExecCtx // all blocks are expected to process this shared context
  waitingforRequestedBlocktoCompleteTimeout?:
    FeBsqrWaitingforRequestedBlocktoCompleteTimeouts<BlocksKeys>
}
// & SequencerExtensionProps

export type FeBsqrCastCtxSlotstoInitiatorType <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {},
> =
  & IFeBsqrExecMods<BlocksKeys, ExecCtx>  // no actual casting needed here
  & {
    // helper initiator slots
    execCtxRef?: ExecCtx
  }

export class FeBlocksSequencerCtx <
  BlocksKeys extends FeBsqrBlocksKeysT,
  ExecCtx extends {},
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> extends IFeBlocksSequencerCtx<BlocksKeys, ExecCtx, Utilities> {

  public constructor(
    public sequencerName: string,
    protected blocksKeysDonor: Record<BlocksKeys, {}>, // must bring all the blocks keys (functional or skipped) and no others
    initiator?: Partial<
      & Pick<
        IFeBlocksSequencerCtx<BlocksKeys, ExecCtx, Utilities>,
        // 'blockstoExecasFunctions'
        // / see in the FeBsqrCastCtxSlotstoInitiatorType below
        'blockstoSkip' | 'builtinBlockstoSkip' |  // these come from level1, while addtoSkipped comes from mod
        'utilities'|'waitingforRequestedBlocktoCompleteTimeout'
      >
      & FeBsqrCastCtxSlotstoInitiatorType<BlocksKeys, ExecCtx>  // ie mod
    >
  ) {
    super()
    if (_feIsNotanEmptyObject(initiator)) {
      const { blockstoSkip, builtinBlockstoSkip, execCtxRef, addtoSkipped, ...trimmedInitiator } = initiator
      Object.assign(this, mergician(this, trimmedInitiator))
    }
    this.utilities ??= {} as typeof this.utilities
    this.engageExecSignals()  // normally should not be overwritten
    this.ctxSignals ??= {} as typeof this.ctxSignals
    this.ctxSignals.sequencerReady ??= new FeReadinessSignaling()
    // catchComm is nor prepared here
    this.blockstoExecasFunctions ??= {} as typeof this.blockstoExecasFunctions
    // _feMakeRecordFeMapLike(this.blockstoExecasFunctions)
    this.blockstoSkip = new Set<BlocksKeys>([
      ...(initiator?.blockstoSkip || []),
      ...(_feIsArray(initiator?.addtoSkipped)
        ? initiator.addtoSkipped
        : initiator?.addtoSkipped?.blocks || []
      )
    ] as Array<BlocksKeys>)
    this.builtinBlockstoSkip = new Set<BlocksKeys>([
      ...(initiator?.builtinBlockstoSkip || []),
      ...(_feIsObject(initiator?.addtoSkipped)
        ? (initiator.addtoSkipped as Exclude<FeBsqrAddtoSkipped<BlocksKeys>, Array<unknown>>).builtinBlocks || []
        : []
      )
    ] as Array<BlocksKeys>)
    if (!_feIsFunction(this.getExecCtx)) {
      if (_feIsObject(initiator?.execCtxRef)) {
        this.getExecCtx = () => initiator?.execCtxRef!
      } else {
        throw new Error(
          `Neither getExecCtx or execCtxRef for ${this.sequencerName || '<unnamed seqiencer>'} were specified`
        )
      }
    } else {
      _feAssertIsSyncFunction<ExecCtx>(
        this.getExecCtx,
        { message: `getExecCtx in ${this.sequencerName || '<unnamed seqiencer>'} is not a function` }
      )
    }
    // this.utilities.catchComm ??= @TODO
    // test @TODO
  }

  assigntoExecCtx (
    toMerge: Partial<ExecCtx>,
    mergicianOptions?: MergicianOptions
  ): ExecCtx {
    const execCtxRef = this.getExecCtx()
    if (_feIsNotanEmptyObject(toMerge)) {
      return Object.assign(execCtxRef, mergician(
        mergicianOptions || {}
      )(
        execCtxRef,
        toMerge
      )) as ExecCtx // returns the target aka this.getExecCtx()
    }
    return execCtxRef
  }

  engageExecSignals () {
    const signals = this.execSignals = { ...this.blocksKeysDonor } as unknown as typeof this.execSignals
    // makes assertion work in depth @TODO does it?
    _feMakeRecordFeMapLike(signals)
    // signals[$fe]?.forEach?.((_, key) => { @TODO make it work by fixing the forEach
    Object.keys(signals).forEach( key => {
      key !== undefined &&  // @TODO if not a question in case of Object.keys
      signals[$fe]?.set?.(key,
        new FeExecSignaling()
      )
    })
  }

  async executeBlock (
    blockId: BlocksKeys,
    waitingforRequestedBlocktoCompleteHandler?: () => Promise<void>
  ) {
    // * Exceptions are let go
    const skip = this.blockstoSkip?.has(blockId)
    const _blockFn = this.blockstoExecasFunctions[blockId]
    const _builtinFn = this.builtinBlocksFunctions?.[blockId]
    const signaling = this.execSignals[blockId]  // @TODO test if usable or throw
    if (!skip) {
      if (_blockFn || !this.builtinBlockstoSkip?.has(blockId)) {
        if (_blockFn) {
          if (!_feIsAsyncFunction(_blockFn)) {
            throw new Error(`${this.sequencerName} got ${blockId} as to be executed as a function but got a non-function value`) // @TODO
          }
        } else {  // blockstoExecasBuiltinFunctions positive
          if (!_feIsAsyncFunction(_builtinFn)) {
            throw new Error(`${this.sequencerName} got ${blockId} as to be executed as a built-in function but got a non-function value`) // @TODO
          }
        }
        signaling.skip({
          message: `${this.sequencerName} is handling ${blockId} in the specified ${_blockFn ? '' : 'built-in'} function call`,
          execSignaling: 'RequestSkipped'
        })
        const ctxfromFn = await (_blockFn || _builtinFn!)(this.getExecCtx())
        signaling.done(ctxfromFn)  // @TODO if failed
        return ctxfromFn
      } else {
        const _timeoutHandler = _feIsAsyncFunction(waitingforRequestedBlocktoCompleteHandler)
          ?
          waitingforRequestedBlocktoCompleteHandler
          :
          _feDelay(
            this.waitingforRequestedBlocktoCompleteTimeout?.[blockId] || __waitingforRequestedBlocktoCompleteDefaultTimeout,
            () => {
              throw new Error(`${this.sequencerName} got ${blockId} as to be executed as a built-in function but got a non-function value`) // @TODO
            } // @TODO will it throw here?
          )
        signaling.request(this.getExecCtx())
        const ctxfromWaiting = await Promise.all([
          signaling.tillDone,
          _timeoutHandler
        ]) as Awaited<ExecCtx>
        return ctxfromWaiting
      }
    } else {
      signaling.skip({
        message: `${this.sequencerName} is skipping ${blockId} block`,
        execSignaling: 'RequestSkipped'
      })
      signaling.skipped()
      return this.getExecCtx()
    }
  }
}
