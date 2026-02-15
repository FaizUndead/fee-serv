I want to initialize the simple nodejs project with
strict typescript setup
jest setup for unit tests
fastify server with one single endpoint "/health" that returns 200
-------
I want to implement POST "/fee" endpoint
That will apply csv file with format like
Fee Type,From,To,Percentage
clearing,0,5002,0.0379
clearing,5003,10001,0.0248
clearing,10002,50000,0.033
clearing,50001,100000,0.0165
transfer,0,5002,0.013
transfer,5003,10001,0.0222
transfer,10002,50000,0.0328
transfer,50001,100000,0.0484
parse and validate it and store it as the config in internal memory so it can be used by other logic
but first let's implement basic functions of our logic using TDD approach
-------
No let's focus ONLY on POST /fee Endpoint functionality no calsulations needed yet
parse and validate it and store it as the config in internal memory
-------
ok Let's do
Phase 1: Type Definitions
-------
Now lets do 
Phase 2: CSV Parser with Tests (TDD)
First just implement tests
-------
Now let's make tests green
-------
Now Phase 3: Config Store with Tests
-------
clearFeeConfig is redundant. should persist config in memory across multiple retrievals is redundant
-------
Now let's add tests for the POST "/fee" controler logic that will process the requests and use parse and store functionality
-------
Reason: test like "should return 400 with invalid percentage in CSV" is redundant as you already did it in service tests controler should be tested only for ability to call functionality and return responses
-------
Now let's make tests green and implement saveFeeConfig controller
-------
controller should be in separate file in controllers folder
-------
move controller tests from @src/server.test.ts  to controllers folder
-------
Now let's add readme and claudemd to the project
-------
/compact
-------
Now i want to implement GET "/fee" endpoint
that will apply { total, type } in the body and based on the this input it feel have to find corresponding fee
and return 
{
    total, // total after fee applied
    type,
    percentage,
    feeAmount, 
  }
First let's plan the implementation and find the apropriate alghorithm or/and way to store fee config to search for the fee effectively
-------
Ok let's choose "Binary Search on sorted ranges within each fee type group"
I want the map to be indexed when we receive the csv with fees so let's make Fee Lookup Service stateless  and responsible to manage the index
it will buildFeeIndex and we will put it to storage
findFeeRule(type, total, index) will apply (type, total, index) and return rule
and calculateFee(total, percentage) will be separate utility function as it's not related to lookup
-------
calculateFee will be separate from Fee Lookup Service
setFeeConfig shouldn't call buildFeeIndex, we will do it in controller. So Config Store stays dumb with the same functionality but different types
-------
Ok looks good
Lets do Add Types
-------
You forgot about TDD approach and making steps one by one
Now let's do Create Fee Lookup Service
-------
 good but 'should find correct rule when multiple ranges exist' 'should handle boundary between ranges correctly' are redundant
-------
we don't need getFeeConfig and any fee config functionality to be used anymore
-------
better let's make GET fee endpoint to apply total, type from query parameters
-------
Let's do clean up
looks like we don't need getFeeConfig setFeeConfig don't needed anymore and their tests