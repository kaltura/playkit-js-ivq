const {ServiceResult} = KalturaPlayer.providers;
import {KalturaUserEntry, KalturaUserEntryArgs} from './kaltura-user-entry';

export class KalturaUserEntryListResponse extends ServiceResult {
  totalCount?: number;
  data: Array<KalturaUserEntry> = [];

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.totalCount = responseObj.totalCount;
      if (this.totalCount! > 0) {
        this.data = [];
        responseObj.objects.map((userEntry: KalturaUserEntryArgs) => this.data.push(new KalturaUserEntry(userEntry)));
      }
    }
  }
}
