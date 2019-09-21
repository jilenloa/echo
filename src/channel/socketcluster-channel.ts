import { EventFormatter } from './../util';
import { Channel } from './channel';
//import * as SocketCluster from "socketcluster";
//import {SCChannel} from "sc-channel";
import {SCClientSocket} from "socketcluster-client";
import {SCChannel} from "sc-channel";

/**
 * This class represents a Socket Cluster channel.
 */
export class SocketClusterChannel extends Channel {
    /**
     * The SocketCluster client instance.
     */
    socket: SCClientSocket;

    /**
     * The name of the channel.
     */
    name: any;

    /**
     * Channel options.
     */
    options: any;

    /**
     * The event formatter.
     */
    eventFormatter: EventFormatter;

    /**
     * The event callbacks applied to the channel.
     */
    events: any = {};

    channelObject: SCChannel;

    connectedOnce: boolean = false;

    /**
     * Create a new class instance.
     */
    constructor(socket: SCClientSocket, name: string, options: any) {
        super();

        this.name = name;
        this.socket = socket;
        this.options = options;
        this.eventFormatter = new EventFormatter(this.options.namespace);
        this.subscribe();
        this.configureReconnector();
    }

    /**
     * Subscribe to a socket-cluster channel.
     */
    subscribe(): void {
        let authParams = this.options.auth || {};
        authParams.url = this.getFullAuthEndpoint();
        this.channelObject = this.socket.subscribe(this.name, {
            data: {
                channel: this.name,
                auth: authParams
            }
        });
        this.channelObject.watch(data => {
            if(typeof this.events[data.event] !== typeof undefined){
                this.events[data.event].forEach(callback => {
                    callback(data.data);
                });
            }
        });
    }

    getFullAuthEndpoint(){
        let protocol = window.location.protocol;
        if(this.options.auth['secure'] || this.options.secure){
            protocol = "https:"
        }
        var hostname = this.options.auth['hostname'] || (this.options.socketcluster['hostname'] || window.location.hostname);
        let host = protocol+'//'+hostname;
        return host+this.options.authEndpoint;
    }

    /**
     * Unsubscribe from channel and ubind event callbacks.
     */
    unsubscribe(): void {
        this.unbind();
        this.channelObject.unwatch();
        this.socket.unsubscribe(this.name);
        this.socket.destroyChannel(this.name);
    }

    /**
     * Listen for an event on the channel instance.
     */
    listen(event: string, callback: Function): SocketClusterChannel {
        this.on(this.eventFormatter.format(event), callback);
        return this;
    }

    /**
     * Stop listening for an event on the channel instance.
     */
    stopListening(event: string): SocketClusterChannel {
        const name = this.eventFormatter.format(event);
        this.channelObject.off(name);
        delete this.events[name];

        return this;
    }

    /**
     * Bind the channel's socket to an event and store the callback.
     */
    on(event: string, callback: Function): void {
        let listener = (data) => {
            callback(data);
        };

        // this.socket.on(event, listener);
        this.channelObject.on(event, listener);
        this.bind(event, listener);
    }

    /**
     * Attach a 'reconnect' listener and bind the event.
     */
    configureReconnector(): void {
        const listener = () => {
            if(!this.connectedOnce){
                this.connectedOnce = true;
                return;
            }
            this.subscribe();
        };

        this.socket.on('connect', listener);
        this.bind('connect', listener);
    }

    /**
     * Bind the channel's socket to an event and store the callback.
     */
    bind(event: string, callback: Function): void {
        this.events[event] = this.events[event] || [];
        this.events[event].push(callback);
    }

    /**
     * Unbind the channel's socket from all stored event callbacks.
     */
    unbind(): void {
        Object.keys(this.events).forEach(event => {
            this.events[event].forEach(callback => {
                this.channelObject.off(event, callback);
            });

            delete this.events[event];
        });
    }
}
