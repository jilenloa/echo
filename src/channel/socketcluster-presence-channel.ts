import { PresenceChannel } from './presence-channel';
import {SocketClusterPrivateChannel} from "./socketcluster-private-channel";

/**
 * This class represents a Socket.io presence channel.
 */
export class SocketClusterPresenceChannel extends SocketClusterPrivateChannel implements PresenceChannel {
    /**
     * Register a callback to be called anytime the member list changes.
     */
    here(callback: Function): SocketClusterPresenceChannel {
        this.on('presence:subscribed', (members: any[]) => {
            callback(members.map(m => m.user_info));
        });

        return this;
    }

    /**
     * Listen for someone joining the channel.
     */
    joining(callback: Function): SocketClusterPresenceChannel {
        this.on('presence:joining', (member) => callback(member.user_info));
        return this;
    }

    /**
     * Listen for someone leaving the channel.
     */
    leaving(callback: Function): SocketClusterPresenceChannel {
        this.on('presence:leaving', (member) => callback(member.user_info));

        return this;
    }

    /**
     * Trigger client event on the channel.
     */
    whisper(eventName: string, data: any): SocketClusterPresenceChannel {

        this.channelObject.emit('client event', {
            channel: this.name,
            event: `client-${eventName}`,
            data: data
        });

        return this;
    }
}
