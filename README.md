# DeploymentAppTest

This can only be ran from one place at a time ATM, please ask me for the .env credentials.

### How to use (for now)

- npm i
- fill .env
- npm run dev

#### What's Done

- new orders in BC are sent to Monday
  - any items considered a "kit" are filtered out, leaving only inventory items
    will need to look into expanding on this, due to the behavior of the kits app with out of stock items.
- status changes in BC are sent to Monday
- middleware that prevents multiples requests to go through via checking the hash
- if status change is sent but the order doesn't exist in Monday, the app pushes the order number to the "new order" cycle
- if fields in new order are invalid, error is thrown
-

##### To Do

- BC Asynchronous info fix
- revamp error handling
- testing scripts (jest? mocha/chai?)
- kit checking automation (pull current kits from BC app to filter out parent bundle items)
