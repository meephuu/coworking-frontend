//"3 of 6 rooms free" for a space returned with ?date= (availableRooms/totalRooms), or nothing if the space has no room count
export default function RoomsLeft({ space }) {
    if (space.availableRooms == null) return null;

    return space.availableRooms === 0
        ? <strong>Fully booked ({space.totalRooms} rooms)</strong>
        : <span><strong>{space.availableRooms}</strong> of {space.totalRooms} rooms free</span>;
}
