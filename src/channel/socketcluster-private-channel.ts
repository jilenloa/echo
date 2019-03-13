
import {SocketClusterChannel} from "./socketcluster-channel";

/**
 * This class represents a SocketCluster presence channel.
 */
export class SocketClusterPrivateChannel extends SocketClusterChannel {
    /**
     * Trigger client event on the channel.
     */
    whisper(eventName: string, data: any): SocketClusterChannel {
        this.channelObject.emit('client event', {
            channel: this.name,
            event: `client-${eventName}`,
            data: data
        });

        return this;
    }
}
