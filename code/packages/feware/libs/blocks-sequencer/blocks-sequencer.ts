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
  PassthruCtl extends {}, // the config/options blocks pass to each other @TODO prototype
> = Record<
  BlocksKeys,
  undefined | ((passthruCtl: PassthruCtl) => Promise<PassthruCtl>)
>

export type FeBsqrExecSignals <
  BlocksKeys extends FeBsqrBlocksKeysT,
  PassthruCtl extends {},
> = Record<
  BlocksKeys,
  FeExecSignaling<PassthruCtl, PassthruCtl>
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
  PassthruCtl extends {},
> {
  addtoSkipped?: FeBsqrAddtoSkipped<BlocksKeys>
  // blockstoSkip?: BlocksKeys[] // @TODO typing
  // builtinBlockstoSkip?: Array<BlocksKeys> // @TODO typing
  blockstoExecasFunctions?: Partial<FeBsqrToExecasFunctions<BlocksKeys, PassthruCtl>>
}

export abstract class IFeBlocksSequencerCtx <
  BlocksKeys extends FeBsqrBlocksKeysT,
  PassthruCtl extends {},
  // * @TODO but basically it's a matter of the implementation, which will pass it arround between blocks
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> /* implements CastArrayTtoSetTinRecord<IFeBsqrExecMods<BlocksKeys, PassthruCtl>> */ {
  blockstoSkip!: Set<BlocksKeys>
  builtinBlockstoSkip!: Set<BlocksKeys>
  blockstoExecasFunctions!: Partial<FeBsqrToExecasFunctions<BlocksKeys, PassthruCtl>>
  protected builtinBlocksFunctions?: Partial<FeBsqrToExecasFunctions<BlocksKeys, PassthruCtl>>
  sequencerName?: string
  execSignals!: FeBsqrExecSignals<BlocksKeys, PassthruCtl>
  ctxSignals!: FeBsqrBaseCtxSignals<Utilities>
  utilities!: Utilities
  getPassthruCtl!: () => PassthruCtl // all blocks are expected to process this shared context
  waitingforRequestedBlocktoCompleteTimeout?:
    FeBsqrWaitingforRequestedBlocktoCompleteTimeouts<BlocksKeys>
}
// & SequencerExtensionProps

export type FeBsqrCastCtxSlotstoInitiatorType < // @TODO
  BlocksKeys extends FeBsqrBlocksKeysT,
  PassthruCtl extends {},
> =
  & IFeBsqrExecMods<BlocksKeys, PassthruCtl>  // no actual casting needed here
  & {
    // helper initiator slots
    passthruCtlRef?: PassthruCtl
  }

export class FeBlocksSequencerCtx <
  BlocksKeys extends FeBsqrBlocksKeysT,
  PassthruCtl extends {},
  Utilities extends IFeBsqrBaseUtilities = IFeBsqrBaseUtilities
> extends IFeBlocksSequencerCtx<BlocksKeys, PassthruCtl, Utilities> {

  public constructor(
    public sequencerName: string,
    protected blocksKeysDonor: Record<BlocksKeys, {}>, // must bring all the blocks keys (functional or skipped) and no others
    initiator?: Partial<
      & Pick<
        IFeBlocksSequencerCtx<BlocksKeys, PassthruCtl, Utilities>,
        // 'blockstoExecasFunctions'
        // / see in the FeBsqrCastCtxSlotstoInitiatorType below
        'blockstoSkip' | 'builtinBlockstoSkip' |  // these come from level1, while addtoSkipped comes from mod
        'utilities'|'waitingforRequestedBlocktoCompleteTimeout'
      >
      & FeBsqrCastCtxSlotstoInitiatorType<BlocksKeys, PassthruCtl>  // ie mod
    >
  ) {
    super()
    if (_feIsNotanEmptyObject(initiator)) {
      const { blockstoSkip, builtinBlockstoSkip, passthruCtlRef, addtoSkipped, ...trimmedInitiator } = initiator
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
    if (!_feIsFunction(this.getPassthruCtl)) {
      if (_feIsObject(initiator?.passthruCtlRef)) {
        this.getPassthruCtl = () => initiator?.passthruCtlRef!
      } else {
        throw new Error(
          `Neither getPassthruCtl or passthruCtlRef for ${this.sequencerName || '<unnamed seqiencer>'} were specified`
        )
      }
    } else {
      _feAssertIsSyncFunction<PassthruCtl>(
        this.getPassthruCtl,
        { message: `getPassthruCtl in ${this.sequencerName || '<unnamed seqiencer>'} is not a function` }
      )
    }
    // this.utilities.catchComm ??= @TODO
    // test @TODO
  }

  assigntoPassthruCtl (
    toMerge: Partial<PassthruCtl>,
    mergicianOptions?: MergicianOptions
  ): PassthruCtl {
    const passthruCtlRef = this.getPassthruCtl()
    if (_feIsNotanEmptyObject(toMerge)) {
      return Object.assign(passthruCtlRef, mergician(
        mergicianOptions || {}
      )(
        passthruCtlRef,
        toMerge
      )) as PassthruCtl // returns the target aka this.getPassthruCtl()
    }
    return passthruCtlRef
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
        const _passthruCtl = await (_blockFn || _builtinFn!)(this.getPassthruCtl())
        signaling.done(_passthruCtl)  // @TODO if failed
        return _passthruCtl
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
        signaling.request(this.getPassthruCtl())
        const _passthruCtl = await Promise.all([
          signaling.tillDone,
          _timeoutHandler
        ]) as Awaited<PassthruCtl>
        return _passthruCtl
      }
    } else {
      signaling.skip({
        message: `${this.sequencerName} is skipping ${blockId} block`,
        execSignaling: 'RequestSkipped'
      })
      signaling.skipped()
      return this.getPassthruCtl()
    }
  }
}
