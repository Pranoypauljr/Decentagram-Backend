pragma solidity ^0.5.0;

contract Decentragram {
  // Code goes here...
  string public name ="hello";

  //store images
  uint public imageCount=0;
  mapping(uint=>Image) public images;
  struct Image{
    uint id;
    string hash;
    string description;
    uint tipamount;
    address payable author;
  }
  event imageCreated(
    uint id,
    string hash,
    string description,
    uint tipamount,
    address payable author
  );
  event imageTipped(
    uint id,
    string hash,
    string description,
    uint tipamount,
    address payable author
  );
  //create images
  function uploadImage(string memory _imghash,string memory _description) public{
    require(bytes(_imghash).length>0);
    require(msg.sender!=address(0x0));
    //increment imageid
    imageCount=imageCount+1;
    //upload image to contract(we store only the hash and not the image value)
    images[imageCount]=Image(imageCount,_imghash,_description,0,msg.sender);
    //emit event
    emit imageCreated(imageCount,_imghash,_description,0,msg.sender);
  }
  //tips images
  function tipowner(uint _id) public payable{

    //make sure id is valid
    require(_id>0 && _id<=imageCount);
    Image memory _image=images[_id];

    //fetch the author
    address payable _author=_image.author;

    //pay author by sending ether
    address(_author).transfer(msg.value);

    //update tip amount
    _image.tipamount+=msg.value;

    //update the image
    images[_id]=_image;

    //Trigger an event
    emit imageTipped(_id,_image.hash,_image.description,_image.tipamount,_author);
  }
}