import {KalturaUserEntry} from './kaltura-user-entry';
const {BaseServiceResult} = KalturaPlayer.providers.ResponseTypes;

export class KalturaUserEntryResponse extends BaseServiceResult {
  data?: KalturaUserEntry;

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.data = new KalturaUserEntry(responseObj);
    }
  }
}
