import { Connector } from './connector';
import {
    SocketClusterChannel,
    SocketClusterPrivateChannel, SocketClusterPresenceChannel
} from './../channel';
import {SCClientSocket} from "socketcluster-client";


/**
 * This class creates a connnector to a SocketCluster server.
 */
export class SocketClusterConnector extends Connector {
    /**
     * The SocketCluster connection instance.
     */
    socket: SCClientSocket;

    /**
     * All of the subscribed channel names.
     */
    channels: {[id: string]: any} = {};

    /**
     * Create a fresh SocketCluster connection.
     */
    connect(): void {
        let socketCluster = this.getSocketCluster();
        this.socket = socketCluster.create(this.options);
    }

    /**
     * Get socket.io module from global scope or options.
     */
    getSocketCluster(): any {
        if (typeof socketCluster !== 'undefined') {
            return socketCluster;
        }

        if (typeof this.options.client !== 'undefined') {
            return this.options.client;
        }

        throw new Error('SocketCluster client not found. Should be globally available or passed via options.client');
    }

    /**
     * Listen for an event on a channel instance.
     */
    listen(name: string, event: string, callback: Function): SocketClusterChannel {
        console.log('connector about to listen on event: '+event);
        console.log('channel '+name);
        return this.channel(name).listen(event, callback);
    }

    /**
     * Get a channel instance by name.
     */
    channel(name: string): SocketClusterChannel {
        if (!this.channels[name]) {
            this.channels[name] = new SocketClusterChannel(
                this.socket,
                name,
                this.options
            );
        }

        return this.channels[name];
    }

    /**
     * Get a private channel instance by name.
     */
    privateChannel(name: string): SocketClusterPrivateChannel {
        if (!this.channels['private-' + name]) {
            this.channels['private-' + name] = new SocketClusterPrivateChannel(
                this.socket,
                'private-' + name,
                this.options
            );
        }

        return this.channels['private-' + name];
    }

    /**
     * Get a presence channel instance by name.
     */
    presenceChannel(name: string): SocketClusterPresenceChannel {
        if (!this.channels['presence-' + name]) {
            this.channels['presence-' + name] = new SocketClusterPresenceChannel(
                this.socket,
                'presence-' + name,
                this.options
            );
        }

        return this.channels['presence-' + name];
    }

    /**
     * Leave the given channel, as well as its private and presence variants.
     */
    leave(name: string): void {
        let channels = [name, 'private-' + name, 'presence-' + name];

        channels.forEach(name => {
            this.leaveChannel(name);
        });
    }

    /**
     * Leave the given channel.
     */
    leaveChannel(name: string): void {
        if (this.channels[name]) {
            this.channels[name].unsubscribe();

            delete this.channels[name];
        }
    }

    /**
     * Get the socket ID for the connection.
     */
    socketId(): string {
        return this.socket.id;
    }

    /**
     * Disconnect SocketCluster connection.
     */
    disconnect(): void {
        this.socket.disconnect();
    }
}
