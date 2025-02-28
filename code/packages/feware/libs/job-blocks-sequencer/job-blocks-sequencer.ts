import { mergician, type MergicianOptions } from 'mergician'  
// * Could have used jsr/std... but that would've made a comfort obstacle for nodejsers 
import type {
  FeTEmptyObject, _Branded, _WithAssertedBrand, _FeMilliseconds,
} from '@mflt/_fe'
import {
  FeExecSignaling, FeReadinessSignaling,
  _feAssertIsSyncFunction, _feIsFunction, _feIsObject, _feIsArray,
  _feIsNotanEmptyObject, _feIsAsyncFunction, _feMakeRecordFeMapLike, $fe, _feDelay, 
} from '@mflt/_fe'


export class FeCat4 { // catch communication
  throwwith: string | undefined
}

export type FeJbsqBlocksKeysT = string

const __waitingforRequestedBlocktoCompleteDefaultTimeout = 5000

export type FeJbsqToExecasFunctions <
  BlocksKeys extends FeJbsqBlocksKeysT,
  JobTerms extends FeTEmptyObject, // the shared config/options/env blocks pass to each other @TODO prototype
> = Record<
  BlocksKeys,
  undefined | ((jobTerms: JobTerms) => Promise<JobTerms>)
>

export type FeJbsqExecSignals <
  BlocksKeys extends FeJbsqBlocksKeysT,
  JobTerms extends FeTEmptyObject,
> = Record<
  BlocksKeys,
  FeExecSignaling<JobTerms, JobTerms>
>

export interface IFeJbsqBaseUtilities {
  c4: FeCat4
}

export type FeJbsqBaseCtxSignals <
  Utilities extends IFeJbsqBaseUtilities = IFeJbsqBaseUtilities
> = {
  sequencerReady: FeReadinessSignaling<Utilities>
}

export type FeJbsqWaitingforRequestedBlocktoCompleteTimeouts <
  BlocksKeys extends FeJbsqBlocksKeysT
> = Record<
  BlocksKeys,  // @TODO partial?
  number | _FeMilliseconds  // @TODO test
>

export type FeJbsqAddtoSkipped  <
  BlocksKeys extends FeJbsqBlocksKeysT
> =
  | Array<BlocksKeys>
  | {
    blocks: Array<BlocksKeys>,
    builtinBlocks: Array<BlocksKeys>
  }

export interface IFeJbsqExecMods <
  BlocksKeys extends FeJbsqBlocksKeysT,
  JobTerms extends FeTEmptyObject,
> {
  addtoSkipped?: FeJbsqAddtoSkipped<BlocksKeys>
  // blockstoSkip?: BlocksKeys[] // @TODO typing
  // builtinBlockstoSkip?: Array<BlocksKeys> // @TODO typing
  blockstoExecasFunctions?: Partial<FeJbsqToExecasFunctions<BlocksKeys, JobTerms>>
}

export abstract class IFeJobBlocksSequencerAsyncCtx <
  BlocksKeys extends FeJbsqBlocksKeysT,
  JobTerms extends FeTEmptyObject,
  // * @TODO but basically it's a matter of the implementation, which will pass it arround between blocks
  Utilities extends IFeJbsqBaseUtilities = IFeJbsqBaseUtilities
> /* implements CastArrayTtoSetTinRecord<IFeJbsqExecMods<BlocksKeys, JobTerms>> */ {
  blockstoSkip!: Set<BlocksKeys>
  builtinBlockstoSkip!: Set<BlocksKeys>
  blockstoExecasFunctions!: Partial<FeJbsqToExecasFunctions<BlocksKeys, JobTerms>>
  protected builtinBlocksFunctions?: Partial<FeJbsqToExecasFunctions<BlocksKeys, JobTerms>>
  sequencerName?: string
  execSignals!: FeJbsqExecSignals<BlocksKeys, JobTerms>
  ctxSignals!: FeJbsqBaseCtxSignals<Utilities>
  utilities!: Utilities
  getJobTerms!: () => JobTerms // all blocks are expected to process this shared, passed thru context/options/env
  waitingforRequestedBlocktoCompleteTimeout?:
    FeJbsqWaitingforRequestedBlocktoCompleteTimeouts<BlocksKeys>
}
// & SequencerExtensionProps

export type FeJbsqCastCtxSlotstoInitiatorType < // @TODO
  BlocksKeys extends FeJbsqBlocksKeysT,
  JobTerms extends FeTEmptyObject,
> =
  & IFeJbsqExecMods<BlocksKeys, JobTerms>  // no actual casting needed here
  & {
    // helper initiator slots
    jobTermsRef?: JobTerms
  }

export class FeJobBlocksSequencerAsyncCtx <
  BlocksKeys extends FeJbsqBlocksKeysT,
  JobTerms extends FeTEmptyObject,
  Utilities extends IFeJbsqBaseUtilities = IFeJbsqBaseUtilities
> extends IFeJobBlocksSequencerAsyncCtx<BlocksKeys, JobTerms, Utilities> {

  public constructor(
    public sequencerName: string,
    protected blocksKeysDonor: Record<BlocksKeys, {}>, // must bring all the blocks keys (functional or skipped) and no others
    initiator?: Partial<
      & Pick<
        IFeJobBlocksSequencerAsyncCtx<BlocksKeys, JobTerms, Utilities>,
        // 'blockstoExecasFunctions'
        // / see in the FeJbsqCastCtxSlotstoInitiatorType below
        'blockstoSkip' | 'builtinBlockstoSkip' |  // these come from level1, while addtoSkipped comes from mod
        'utilities'|'waitingforRequestedBlocktoCompleteTimeout'
      >
      & FeJbsqCastCtxSlotstoInitiatorType<BlocksKeys, JobTerms>  // ie mod
    >
  ) {
    super()
    if (_feIsNotanEmptyObject(initiator)) {
      const { blockstoSkip, builtinBlockstoSkip, jobTermsRef, addtoSkipped, ...trimmedInitiator } = initiator
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
        ? (initiator.addtoSkipped as Exclude<FeJbsqAddtoSkipped<BlocksKeys>, Array<unknown>>).builtinBlocks || []
        : []
      )
    ] as Array<BlocksKeys>)
    if (!_feIsFunction(this.getJobTerms)) {
      if (_feIsObject(initiator?.jobTermsRef)) {
        this.getJobTerms = () => initiator?.jobTermsRef!
      } else {
        throw new Error(
          `Neither getJobTerms or jobTermsRef for ${this.sequencerName || '<unnamed seqiencer>'} were specified`
        )
      }
    } else {
      _feAssertIsSyncFunction<JobTerms>(
        this.getJobTerms,
        { message: `getJobTerms in ${this.sequencerName || '<unnamed seqiencer>'} is not a function` }
      )
    }
    // this.utilities.catchComm ??= @TODO
    // test @TODO
  }

  assigntoJobTerms (
    toMerge: Partial<JobTerms>,
    mergicianOptions?: MergicianOptions
  ): JobTerms {
    const jobTermsRef = this.getJobTerms()
    if (_feIsNotanEmptyObject(toMerge)) {
      return Object.assign(jobTermsRef, mergician(
        mergicianOptions || {}
      )(
        jobTermsRef,
        toMerge
      )) as JobTerms // returns the target aka this.getJobTerms()
    }
    return jobTermsRef
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
        const _jobTermsRef = await (_blockFn || _builtinFn!)(this.getJobTerms())
        signaling.done(_jobTermsRef)  // @TODO if failed
        return _jobTermsRef
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
        signaling.request(this.getJobTerms())
        const _jobTermsRef = await Promise.all([
          signaling.tillDone,
          _timeoutHandler
        ]) as Awaited<JobTerms>
        return _jobTermsRef
      }
    } else {
      signaling.skip({
        message: `${this.sequencerName} is skipping ${blockId} block`,
        execSignaling: 'RequestSkipped'
      })
      signaling.skipped()
      return this.getJobTerms()
    }
  }
}
