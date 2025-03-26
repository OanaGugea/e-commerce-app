provider "aws" {
  region = "eu-central-1" # Change as needed
}

// create lambda execution role
# resource "aws_iam_role" "lambda_role" {
#   name = "lambda-execution-role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Action = "sts:AssumeRole"
#       Effect = "Allow"
#       Principal = {
#         Service = "lambda.amazonaws.com"
#       }
#     }]
#   })
# }

// attach policy to lambda execution role
# resource "aws_iam_policy_attachment" "lambda_basic_execution" {
#   name       = "lambda-basic-execution"
#   roles      = [aws_iam_role.lambda_role.name]
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
# }

// create lambda function with previously defined role
# resource "aws_lambda_function" "my_lambda" {
#   function_name    = "MyTypeScriptLambda"
#   role             = aws_iam_role.lambda_role.arn
#   handler         = "index.handler"
#   runtime         = "nodejs22.x"
#   filename        = "${path.module}/../dist/lambda.zip"
#   source_code_hash = filebase64sha256("${path.module}/../dist/lambda.zip")

#   environment {
#     variables = {
#       NODE_ENV = "production"
#     }
#   }
# }

// create api gateway
# resource "aws_apigatewayv2_api" "api" {
#   name          = "lambda-api"
#   protocol_type = "HTTP"
# }

// create lambda api gateway integration
# resource "aws_apigatewayv2_integration" "lambda_integration" {
#   api_id           = aws_apigatewayv2_api.api.id
#   integration_type = "AWS_PROXY"
#   integration_uri  = aws_lambda_function.my_lambda.invoke_arn
# }

// give api gateway invoke permission to lambda
# resource "aws_lambda_permission" "apigw_invoke" {
#   statement_id  = "AllowAPIGatewayInvoke"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.my_lambda.function_name
#   principal     = "apigateway.amazonaws.com"

#   source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
# }


// create api gateway default route
# resource "aws_apigatewayv2_route" "default_route" {
#   api_id    = aws_apigatewayv2_api.api.id
#   route_key = "GET /"
#   target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
# }

// create api gateway stage
# resource "aws_apigatewayv2_stage" "api_stage" {
#   api_id = aws_apigatewayv2_api.api.id
#   name   = "dev"
#   auto_deploy = true
# }
