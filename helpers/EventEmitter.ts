type IListener = <T = unknown>(...args: T[]) => void;
class EventsEmitter<Events extends {[K in keyof Events]: IListener}> {
  private events: Map<keyof Events, Set<IListener>>;
  constructor() {
    this.events = new Map();
  }
  public on<Event extends keyof Events>(event: Event, listener: Events[Event]): () => void {
    if (!this.events.has(event)) this.events.set(event, new Set());
    (this.events.get(event) as Set<IListener>).add(listener);
    return () => this.removeEvent(event, listener);
  }
  public once<Event extends keyof Events>(event: Event, listener: Events[Event]): void {
    // prettier-ignore
    const call = () => (...args: unknown[]) => {
        remove();
        listener.apply(this, args);
      };
    const remove = this.on(event, call() as Events[Event]);
  }
  public emit<Event extends keyof Events>(event: Event, ...args: unknown[]): void {
    if (!this.events.has(event)) this.events.set(event, new Set());
    (this.events.get(event) as Set<IListener>).forEach((listener) => listener(...args));
  }
  public removeEvent<Event extends keyof Events>(event: Event, listener: Events[Event]): void {
    this.ensure(event);
    (this.events.get(event) as Set<IListener>).delete(listener);
  }
  public clearEvents(event: keyof Events): void {
    this.ensure(event);
    this.events.set(event, new Set());
  }
  private ensure(event: keyof Events) {
    if (!this.events.has(event)) throw new Error("event: " + event + " not found.");
  }
}

class EventEmitter<Listener extends IListener> {
  private event: Set<Listener>;
  public constructor() {
    this.event = new Set();
  }
  public on(listener: Listener): () => void {
    this.event.add(listener);
    return () => this.removeEvent(listener);
  }
  public once(listener: Listener): void {
    // prettier-ignore
    const call = () => (...args: unknown[]) => {
        remove();
        listener.apply(this, args);
      };
    const remove = this.on(call() as Listener);
  }
  public emit(...args: unknown[]): void {
    this.event.forEach((listener) => listener(...args));
  }
  public removeEvent(listener: Listener): void {
    this.event.delete(listener);
  }
  public clearEvents(): void {
    this.event.clear();
  }
}

export {EventEmitter, EventsEmitter};
