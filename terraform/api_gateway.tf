// create api gateway rescource
resource "aws_api_gateway_rest_api" "dynamodb_api" {
  name        = "DynamoDBAPI"
  description = "API for DynamoDB operations"
}

// add the path /items to the REST API
resource "aws_api_gateway_resource" "items_resource" {
  rest_api_id = aws_api_gateway_rest_api.dynamodb_api.id
  parent_id   = aws_api_gateway_rest_api.dynamodb_api.root_resource_id
  path_part   = "items"
}

// add a GET method to the /items path
resource "aws_api_gateway_method" "get_items" {
  rest_api_id   = aws_api_gateway_rest_api.dynamodb_api.id
  resource_id   = aws_api_gateway_resource.items_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

// add a POST method to the /items path
resource "aws_api_gateway_method" "post_method" {
  rest_api_id   = aws_api_gateway_rest_api.dynamodb_api.id
  resource_id   = aws_api_gateway_resource.items_resource.id
  http_method   = "POST"
  authorization = "NONE"  
}

// create an integration between the GET method in api gateway and the Lambda function
resource "aws_api_gateway_integration" "get_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.dynamodb_api.id
  resource_id = aws_api_gateway_resource.items_resource.id
  http_method = aws_api_gateway_method.get_items.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.dynamodb_lambda.invoke_arn
}

// create an integration between the POST method in api gateway and the Lambda function
resource "aws_api_gateway_integration" "post_lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dynamodb_api.id
  resource_id             = aws_api_gateway_resource.items_resource.id
  http_method             = aws_api_gateway_method.post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.dynamodb_lambda.invoke_arn
}

// allow API Gateway to invoke the lambda function
resource "aws_lambda_permission" "apigw_post_invoke" {
  statement_id  = "AllowAPIGatewayInvokePOST"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.dynamodb_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.dynamodb_api.execution_arn}/*/POST/"
}

// create a deployment for the REST API
resource "aws_api_gateway_deployment" "dynamodb_api_deployment" {
  depends_on = [aws_api_gateway_integration.get_lambda_integration, aws_api_gateway_integration.post_lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.dynamodb_api.id
}

// create api gateway stage
resource "aws_api_gateway_stage" "dynamodb_api_stage" {
  rest_api_id = aws_api_gateway_rest_api.dynamodb_api.id
  deployment_id = aws_api_gateway_deployment.dynamodb_api_deployment.id
  stage_name = "dev"
}


