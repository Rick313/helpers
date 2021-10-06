type PipeFn<T = unknown> = (value: T) => T | Promise<T>;
type SubscriptionNext<T> = (value: T) => void | Promise<void> | null;
type SubscriptionError = (error: any) => void | Promise<void> | null;
type SubscriptionComplete<T> = (value: T) => void | Promise<void> | null;
type SubscriptionFn<T> = SubscriptionComplete<T> | SubscriptionError | SubscriptionNext<T>;
type SubscriptionType = keyof Subscription<unknown>;
interface SubsciberOption<T> {
  observer: Observer<T>;
  subscription: Subscription<T>;
}
interface Subscription<T> {
  next: SubscriptionNext<T> | null;
  complete: SubscriptionError | null;
  error: SubscriptionComplete<T> | null;
}

abstract class AObsevable<T> {
  protected pipes: PipeFn<T>[];
  protected readonly observer: Observer<T>;
  public constructor(observer: Observer<T>) {
    this.observer = observer;
    this.pipes = [];
  }
  public next(value: T) {
    this.observer.set("next", value);
    return this;
  }

  protected error(reason: any) {
    this.observer.set("error", reason);
    return this;
  }

  public complete() {
    this.observer.set("complete", this.observer.cache as T);
    return this;
  }

  public pipe(...pipes: PipeFn<T>[]) {
    this.pipes.push(...pipes);
    return this;
  }
}

class Observer<T> {
  private readonly observer: Map<SubscriptionType, SubscriptionFn<T>[]>;
  public cache: T | null;
  public constructor(initial?: T) {
    this.observer = new Map();
    this.cache = initial || null;
    this.initialize();
  }

  public change(subscription: SubscriptionNext<T>) {
    this.pushSubscriptionFn("next", subscription);
    return this;
  }

  public error(subscription: SubscriptionError) {
    this.pushSubscriptionFn("error", subscription);
    return this;
  }

  public complete(subscription: SubscriptionComplete<T>) {
    this.pushSubscriptionFn("complete", subscription);
    return this;
  }

  public set(type: SubscriptionType, value: T) {
    const subscibers = this.observer.get(type);
    if (!subscibers) return;
    if (type === "next")
      subscibers.forEach(async (subsciber) => {
        try {
          await subsciber(value);
          this.cache = value;
        } catch (error) {
          this.set("error", error);
        }
      });
    if (type === "error") subscibers.forEach((subsciber) => subsciber(value));
    if (type === "complete") {
      subscibers.forEach((subsciber) => subsciber(this.cache as T));
      this.clear();
    }
    return this;
  }

  public remove<K extends keyof Subscription<T>>(type: K, subscriptionFn: Subscription<T>[K]) {
    let subscriptions = this.observer.get(type);
    if (!subscriptions) return;
    subscriptions = subscriptions.filter((i) => i !== subscriptionFn);
    this.observer.set(type, subscriptions);
  }

  public clear() {
    this.initialize();
  }

  public initialize() {
    this.observer.set("next", []);
    this.observer.set("error", []);
    this.observer.set("complete", []);
  }

  private pushSubscriptionFn<K extends SubscriptionType>(type: K, subscriptionFn: Subscription<T>[K]) {
    const obs = this.observer.get(type);
    if (obs) obs.push(subscriptionFn as SubscriptionFn<T>);
  }
}

class Subsciber<T> extends AObsevable<T> {
  private readonly subscription: Subscription<T>;
  public constructor(options: SubsciberOption<T>) {
    const {observer, subscription} = options;
    super(observer);
    if (subscription.next) subscription.next = this.apply(subscription.next);
    this.subscription = subscription;
    this.initialize();
    this.observer.set("next", this.observer.cache as T);
  }

  public unsubscribe() {
    this.observer.remove("next", this.subscription.next);
    this.observer.remove("error", this.subscription.error);
    this.observer.remove("complete", this.subscription.complete);
  }

  private initialize() {
    if (this.subscription.next) this.observer.change(this.subscription.next);
    if (this.subscription.error) this.observer.change(this.subscription.error);
    if (this.subscription.complete) this.observer.change(this.subscription.complete);
  }

  private apply(subscriptionFn: SubscriptionNext<T>) {
    return async (value: T | Promise<T>) => {
      value = this.pipes.reduce(async (acc, pipe) => {
        try {
          value = await pipe(await acc);
        } catch (err) {
          this.observer.error(err);
        }
        return value;
      }, Promise.resolve(value));
      subscriptionFn(await value);
    };
  }
}

class Observable<T> extends AObsevable<T> {
  public constructor(initial?: T) {
    super(new Observer(initial));
  }

  public subscribe(): Subsciber<T>;
  public subscribe(subscription?: Subscription<T>): Subsciber<T>;
  public subscribe(subscription?: SubscriptionNext<T>, error?: SubscriptionError): Subsciber<T>;
  // prettier-ignore
  public subscribe(subscription?: Subscription<T> | SubscriptionNext<T>, error?: SubscriptionError): Subsciber<T> {
    if (!subscription)
      subscription = function () {
        return;
      };
    if (typeof subscription === "function") {
      subscription = {
        complete: null,
        next: subscription,
        error: !!error && typeof error === "function" ? error : null,
      };
    }
    return new Subsciber<T>({subscription, observer: this.observer});
  }

  public unsubscribe(): void {
    this.observer.clear();
  }
}

export {Observable};
