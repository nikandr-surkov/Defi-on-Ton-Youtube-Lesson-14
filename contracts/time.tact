import "@stdlib/deploy";

contract Time with Deployable {

    deployTime: Int as uint32;

    init() {
        self.deployTime = now(); // Returns Unix time, the number of seconds since the epoch
    }

    receive("wait 10s") {
        require(now() - self.deployTime > 10, "You haven't waited long enough.");
        dump("Thank you for waiting 10 seconds.");
    }

    receive("wait 10d") {
        require(now() - self.deployTime > 10 * 24 * 60 * 60, "You haven't waited long enough.");
        dump("Thank you for waiting 10 days.");
    }

    get fun unixTime(): Int {
        return now();
    }

    get fun stringTime(): String {
        let sb: StringBuilder = beginString();
        sb.append(now().toString());
        sb.append(" seconds have elapsed since January 1, 1970.");
        return sb.toString();
    }

}
