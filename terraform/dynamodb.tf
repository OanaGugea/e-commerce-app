resource "aws_dynamodb_table" "items" {
  name           = "ItemsTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "ItemsTable"
  }
}
