pragma solidity ^0.5.0;

contract Book {
	address[33] public bookers;

	function book(uint bookId) public returns (uint){
  		require(bookId >= 0 && bookId <= 32);

  		bookers[bookId] = msg.sender;
  		return bookId;
	}

	function getBookers() public view returns (address[33] memory) {
  		return bookers;
	}
}