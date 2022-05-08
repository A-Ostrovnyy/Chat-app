// TODO: rename it to the utils;
const users = [];
export const addUser = ({socket_id, name, user_id, room_id}) => {
  const isUserExist = users.find((user) => user.roomId === room_id && user.user.id === user_id );
  if (isUserExist) {
    return {error: 'User already present in this room'};
  }
  const user = {socket_id, name, user_id, room_id};
  users.push(user);
  // console.log('addUser users: ', users);
  return {user};
};

export const removeUser = (socket_id) => {
  const removedUserIndex = users.findIndex((user) => user.socket_id === socket_id);
  if (removedUserIndex > 0) {
    users.splice(removedUserIndex, 1)[0];
  }
  // console.log('removeUser users: ', users);
}

export const getUser = (socket_id) => {
  const user = users.find((user) => user.socket_id === socket_id);
  // console.log('getUser users: ', users);
  return user;
}
