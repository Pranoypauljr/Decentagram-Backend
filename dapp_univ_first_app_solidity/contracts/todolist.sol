pragma solidity ^0.5.0;
contract todolist{
    uint public listcount=0;

struct Task{
    uint id;
    string content;
    bool completed;
}
constructor() public{
    createTask("wash dishes");
}
mapping(uint=>Task) public tasks;
function createTask(string memory _content) public{
    listcount+=1;
    tasks[listcount]=Task(listcount,_content,false);
}
}